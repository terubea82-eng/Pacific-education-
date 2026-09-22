package org.pacificeducation.app;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
public final class MainActivity extends Activity {
 private static final String START_URL="https://terubea82-eng.github.io/Pacific-education-/";
 private WebView webView;
 @Override protected void onCreate(Bundle b){super.onCreate(b);webView=new WebView(this);webView.setWebViewClient(new WebViewClient());WebSettings s=webView.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setCacheMode(WebSettings.LOAD_DEFAULT);webView.loadUrl(START_URL);setContentView(webView);}
 @Override public void onBackPressed(){if(webView!=null&&webView.canGoBack()){webView.goBack();return;}super.onBackPressed();}
 @Override protected void onDestroy(){if(webView!=null){webView.stopLoading();webView.destroy();webView=null;}super.onDestroy();}
}
