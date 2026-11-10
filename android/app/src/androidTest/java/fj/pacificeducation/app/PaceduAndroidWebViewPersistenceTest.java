package fj.pacificeducation.app;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import android.webkit.WebView;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@RunWith(AndroidJUnit4.class)
public final class PaceduAndroidWebViewPersistenceTest {
    private static final String TAG = "PacEduWebViewPersistence";
    private static final String TEST_ORIGIN = "https://pacedu.test/";
    private static final String DATABASE_NAME = "pacedu-android-webview-resilience-v1";

    /*
     * Run the writer and reader as separate instrumentation invocations with
     * an adb force-stop between them. Both use MainActivity's real configured
     * WebView and the target application's WebView data directory.
     */
    @Test
    public void writeRecordBeforeProcessRestart() throws Exception {
        logRuntimePackageIdentity();
        withRealPacEduWebView(webView -> {
            String html = "<!doctype html><meta charset='utf-8'><script>"
                    + "window.__paceduProbe='PENDING';"
                    + "var r=indexedDB.open('" + DATABASE_NAME + "',1);"
                    + "r.onupgradeneeded=function(){r.result.createObjectStore('records');};"
                    + "r.onerror=function(){window.__paceduProbe='OPEN_ERROR';};"
                    + "r.onsuccess=function(){var db=r.result,tx=db.transaction('records','readwrite');"
                    + "tx.objectStore('records').put({marker:'PACEDU_WEBVIEW_PERSISTED',"
                    + "writtenAt:'staging-test'},'survival-probe');"
                    + "tx.oncomplete=function(){window.__paceduProbe='WRITE_OK';db.close();};"
                    + "tx.onerror=function(){window.__paceduProbe='WRITE_ERROR';};};"
                    + "</script>";
            loadHtmlOnUiThread(webView, html);
            assertEquals("\"WRITE_OK\"", waitForResult(webView));
            Log.i(TAG, "PACEDU_INDEXEDDB_WRITE=WRITE_OK");
        });
    }

    @Test
    public void readRecordAfterProcessRestart() throws Exception {
        withRealPacEduWebView(webView -> {
            String html = "<!doctype html><meta charset='utf-8'><script>"
                    + "window.__paceduProbe='PENDING';"
                    + "var r=indexedDB.open('" + DATABASE_NAME + "',1);"
                    + "r.onerror=function(){window.__paceduProbe='OPEN_ERROR';};"
                    + "r.onsuccess=function(){var db=r.result;"
                    + "if(!db.objectStoreNames.contains('records')){window.__paceduProbe='STORE_MISSING';return;}"
                    + "var tx=db.transaction('records','readonly'),q=tx.objectStore('records').get('survival-probe');"
                    + "q.onsuccess=function(){window.__paceduProbe=q.result&&q.result.marker==='PACEDU_WEBVIEW_PERSISTED'?'READ_OK':'RECORD_MISSING';db.close();};"
                    + "q.onerror=function(){window.__paceduProbe='READ_ERROR';};};"
                    + "</script>";
            loadHtmlOnUiThread(webView, html);
            assertEquals("\"READ_OK\"", waitForResult(webView));
            Log.i(TAG, "PACEDU_INDEXEDDB_READ=READ_OK");
        });
    }


    /*
     * Capture package identity while the instrumentation target is installed,
     * before Gradle performs any post-test uninstall/cleanup.
     */
    private void logRuntimePackageIdentity() throws Exception {
        android.app.Instrumentation instrumentation =
                androidx.test.platform.app.InstrumentationRegistry.getInstrumentation();
        Context targetContext = instrumentation.getTargetContext();
        Context testContext = instrumentation.getContext();
        PackageManager packageManager = targetContext.getPackageManager();
        ApplicationInfo targetInfo = packageManager.getApplicationInfo(
                targetContext.getPackageName(), 0);

        Log.i(TAG, "PACEDU_TARGET_PACKAGE=" + targetContext.getPackageName());
        Log.i(TAG, "PACEDU_TARGET_APK_PATH=" + targetInfo.sourceDir);
        Log.i(TAG, "PACEDU_TEST_PACKAGE=" + testContext.getPackageName());
        Log.i(TAG, "PACEDU_TARGET_PACKAGE_VISIBLE="
                + (packageManager.getApplicationInfo(targetContext.getPackageName(), 0) != null));
        for (ApplicationInfo installed : packageManager.getInstalledApplications(0)) {
            if (installed.packageName.equals(targetContext.getPackageName())
                    || installed.packageName.equals(testContext.getPackageName())) {
                Log.i(TAG, "PACEDU_INSTRUMENTATION_PACKAGE_ENTRY="
                        + installed.packageName + "|" + installed.sourceDir);
            }
        }
    }

    private interface WebViewAction { void run(WebView webView) throws Exception; }

    private void withRealPacEduWebView(WebViewAction action) throws Exception {
        AtomicReference<WebView> target = new AtomicReference<>();
        AtomicReference<Exception> failure = new AtomicReference<>();
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            scenario.onActivity(activity -> {
                try {
                    Method open = MainActivity.class.getDeclaredMethod("showWebPlatform");
                    open.setAccessible(true);
                    open.invoke(activity);
                    Field field = MainActivity.class.getDeclaredField("webView");
                    field.setAccessible(true);
                    WebView view = (WebView) field.get(activity);
                    assertNotNull(view);
                    target.set(view);
                } catch (Exception e) {
                    failure.set(e);
                }
            });
            if (failure.get() != null) throw failure.get();
            assertNotNull(target.get());
            waitForHostedPageReady(scenario);
            action.run(target.get());
        }
    }

    private void waitForHostedPageReady(ActivityScenario<MainActivity> scenario) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(45);
        while (System.nanoTime() < deadline) {
            AtomicReference<Boolean> ready = new AtomicReference<>(false);
            scenario.onActivity(activity -> {
                try {
                    Field field = MainActivity.class.getDeclaredField("webPageReady");
                    field.setAccessible(true);
                    ready.set(field.getBoolean(activity));
                } catch (Exception e) {
                    throw new IllegalStateException("Unable to inspect WebView page readiness", e);
                }
            });
            if (Boolean.TRUE.equals(ready.get())) return;
            Thread.sleep(200);
        }
        throw new AssertionError("Timed out waiting for MainActivity WebView onPageFinished");
    }

    private void loadHtmlOnUiThread(WebView webView, String html) {
        androidx.test.platform.app.InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> {
            // The hosted APP_URL navigation must finish before the deterministic probe
            // page is installed; stop any remaining navigation before replacing it.
            webView.stopLoading();
            webView.loadDataWithBaseURL(TEST_ORIGIN, html, "text/html", "UTF-8", null);
        });
    }

    private String waitForResult(WebView webView) throws Exception {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(20);
        while (System.nanoTime() < deadline) {
            AtomicReference<String> value = new AtomicReference<>();
            CountDownLatch latch = new CountDownLatch(1);
            androidx.test.platform.app.InstrumentationRegistry.getInstrumentation().runOnMainSync(
                    () -> webView.evaluateJavascript("window.__paceduProbe || 'PENDING'", result -> {
                        value.set(result);
                        latch.countDown();
                    }));
            if (!latch.await(3, TimeUnit.SECONDS)) continue;
            if (value.get() != null && !"\"PENDING\"".equals(value.get())) return value.get();
            Thread.sleep(150);
        }
        throw new AssertionError("Timed out waiting for IndexedDB result in Android WebView");
    }
}
