package fj.pacificeducation.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.Voice;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.content.SharedPreferences;

import java.util.Locale;
import java.util.Set;

public final class MainActivity extends Activity {
    private static final String APP_ORIGIN = "https://terubea82-eng.github.io";
    private static final String APP_URL =
            "https://terubea82-eng.github.io/Pacific-education-/src/index.html?v=20261004-pilot-voice";
    private static final String PRIVACY_URL =
            "https://terubea82-eng.github.io/Pacific-education-/privacy-policy.html";
    private static final String PREFS = "pacificEducationNativePilot";
    private static final String DAY_ONE_COMPLETE = "dayOneComplete";
    private static final String WELCOME_TEXT =
            "Welcome to Pacific Education. We are pleased to welcome you. Learn, discover, practise and grow with us.";

    private WebView webView;
    private SharedPreferences prefs;
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;
    private String pendingNativeSpeech = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        textToSpeech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int languageResult = textToSpeech.setLanguage(Locale.US);
                ttsReady = languageResult != TextToSpeech.LANG_MISSING_DATA
                        && languageResult != TextToSpeech.LANG_NOT_SUPPORTED;
                if (ttsReady) {
                    selectPreferredVoice();
                    textToSpeech.setSpeechRate(0.95f);
                    speakNativeNow(WELCOME_TEXT);
                    if (!pendingNativeSpeech.isEmpty()) {
                        String queued = pendingNativeSpeech;
                        pendingNativeSpeech = "";
                        speakNativeNow(queued);
                    }
                }
            }
        });
        showNativeHome();
    }

    private void selectPreferredVoice() {
        if (textToSpeech == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return;
        try {
            Set<Voice> voices = textToSpeech.getVoices();
            if (voices == null) return;
            Voice fallback = null;
            Voice maleFallback = null;
            for (Voice voice : voices) {
                if (voice == null || voice.getLocale() == null) continue;
                if (!Locale.ENGLISH.getLanguage().equals(voice.getLocale().getLanguage())) continue;
                if (fallback == null) fallback = voice;
                String name = String.valueOf(voice.getName()).toLowerCase(Locale.ROOT);
                if (name.contains("male") || name.contains("man")
                        || name.contains("david") || name.contains("mark") || name.contains("ryan")
                        || name.contains("guy") || name.contains("alex") || name.contains("daniel")
                        || name.contains("james") || name.contains("john") || name.contains("tom")
                        || name.contains("aaron") || name.contains("arthur") || name.contains("oliver")) {
                    maleFallback = voice;
                    if (name.contains("male") || name.contains("david") || name.contains("mark")
                            || name.contains("ryan") || name.contains("guy")) {
                        textToSpeech.setVoice(voice);
                        return;
                    }
                }
            }
            if (maleFallback != null) textToSpeech.setVoice(maleFallback);
            // Do not silently replace the requested male voice with an arbitrary
            // (possibly female) English voice. If this device exposes no recognizable
            // male English voice, the engine keeps its configured voice rather than
            // pretending that gender selection succeeded.
        } catch (Exception ignored) {
        }
    }

    private boolean speakNativeNow(String text) {
        if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) return false;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "pacific-education");
                return result == TextToSpeech.SUCCESS;
            } else {
                @SuppressWarnings("deprecation")
                int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null);
                return result == TextToSpeech.SUCCESS;
            }
        } catch (Exception error) {
            return false;
        }
    }

    private final class NativeSpeechBridge {
        @JavascriptInterface
        public boolean speak(String text) {
            if (text == null || text.trim().isEmpty()) return false;
            if (!ttsReady || textToSpeech == null) {
                pendingNativeSpeech = text;
                return true;
            }
            return speakNativeNow(text);
        }

        @JavascriptInterface
        public void stop() {
            pendingNativeSpeech = "";
            if (textToSpeech != null) {
                try { textToSpeech.stop(); } catch (Exception ignored) {}
            }
        }

        @JavascriptInterface
        public boolean available() {
            return ttsReady && textToSpeech != null;
        }
    }

    private TextView text(String value, int size) {
        TextView v = new TextView(this);
        v.setText(value);
        v.setTextSize(size);
        v.setPadding(28, 18, 28, 18);
        return v;
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setPadding(20, 14, 20, 14);
        return b;
    }

    private void showNativeHome() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(18, 18, 18, 18);

        TextView title = text("Pacific Education", 28);
        root.addView(title);

        root.addView(text(
                "Controlled pilot • Native Android home and offline Day 1 learning",
                16));

        root.addView(text(
                "This Android build includes native learner functionality. "
                + "The full curriculum platform opens separately from this native home.",
                15));

        Button dayOne = button(
                prefs.getBoolean(DAY_ONE_COMPLETE, false)
                        ? "Day 1: My First English Words — Completed"
                        : "Start Day 1: My First English Words");
        dayOne.setOnClickListener(v -> showDayOneLesson());
        root.addView(dayOne);

        Button platform = button("Open Full Pacific Education Platform");
        platform.setOnClickListener(v -> showWebPlatform());
        root.addView(platform);

        Button safety = button("Pilot Safety & Data Notice");
        safety.setOnClickListener(v -> showSafetyNotice());
        root.addView(safety);

        Button privacy = button("Privacy Policy");
        privacy.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(PRIVACY_URL));
            startActivity(intent);
        });
        root.addView(privacy);

        root.addView(text(
                "Offline Day 1 completion is stored only on this device. "
                + "Do not enter passwords, payment credentials, sensitive child information, "
                + "or exact child location during the controlled pilot.",
                14));

        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);
        setContentView(scroll);
    }

    private void showDayOneLesson() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(18, 18, 18, 18);

        root.addView(text("Day 1 — My First English Words", 25));
        root.addView(text("Learn three simple words and phrases:", 17));
        root.addView(text("Hello — a greeting.", 18));
        root.addView(text("Goodbye — a way to say you are leaving.", 18));
        root.addView(text("Thank you — words used to show appreciation.", 18));

        Button complete = button(
                prefs.getBoolean(DAY_ONE_COMPLETE, false)
                        ? "Day 1 Completed"
                        : "Complete Day 1");
        complete.setOnClickListener(v -> {
            prefs.edit().putBoolean(DAY_ONE_COMPLETE, true).apply();
            complete.setText("Day 1 Completed");
            Toast.makeText(this, "Day 1 progress saved on this device.", Toast.LENGTH_SHORT).show();
        });
        root.addView(complete);

        Button back = button("Back to Native Home");
        back.setOnClickListener(v -> showNativeHome());
        root.addView(back);

        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);
        setContentView(scroll);
    }

    private void showSafetyNotice() {
        new android.app.AlertDialog.Builder(this)
                .setTitle("Controlled Pilot Safety")
                .setMessage(
                        "Pacific Education is in a controlled pilot. "
                        + "The production gate remains fail-closed until required production "
                        + "security, privacy, safeguarding, curriculum, hosting, database, "
                        + "authentication and payment controls are independently verified.\n\n"
                        + "Do not enter sensitive child information, passwords, payment credentials "
                        + "or exact child location.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showWebPlatform() {
        webView = new WebView(this);
        configureWebView(webView);
        setContentView(webView);
        webView.loadUrl(APP_URL);
    }

    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }
        settings.setMediaPlaybackRequiresUserGesture(true);

        view.addJavascriptInterface(new NativeSpeechBridge(), "PacificEducationNativeTTS");

        view.setVerticalScrollBarEnabled(true);
        view.setHorizontalScrollBarEnabled(false);
        view.setBackgroundColor(0xFFFFFFFF);

        view.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(Uri.parse(url));
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                view.setVisibility(View.VISIBLE);
                super.onPageStarted(view, url, favicon);
            }
        });

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
    }

    private boolean handleUrl(Uri uri) {
        if (uri == null) return true;

        String scheme = uri.getScheme();
        String host = uri.getHost();

        if ("https".equalsIgnoreCase(scheme)
                && APP_ORIGIN.equalsIgnoreCase(scheme + "://" + host)) {
            return false;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
        startActivity(intent);
        return true;
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            showNativeHome();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) {
            webView.saveState(outState);
        }
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        if (textToSpeech != null) {
            try { textToSpeech.stop(); } catch (Exception ignored) {}
            textToSpeech.shutdown();
            textToSpeech = null;
            ttsReady = false;
        }
        super.onDestroy();
    }
}
