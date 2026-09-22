plugins {
    id("com.android.application")
}
android {
    namespace = "fj.pacificeducation.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "fj.pacificeducation.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1-pilot"
    }
    buildFeatures { buildConfig = true }
    signingConfigs {
        create("release") {
            val p=System.getenv("KEYSTORE_PATH"); val sp=System.getenv("KEYSTORE_PASSWORD")
            val a=System.getenv("KEY_ALIAS"); val kp=System.getenv("KEY_PASSWORD")
            if(!p.isNullOrBlank()&&!sp.isNullOrBlank()&&!a.isNullOrBlank()&&!kp.isNullOrBlank()){
                storeFile=file(p); storePassword=sp; keyAlias=a; keyPassword=kp
            }
        }
    }
    buildTypes {
        debug { applicationIdSuffix=".debug"; versionNameSuffix="-debug" }
        release {
            isMinifyEnabled=true
            isShrinkResources=true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"),"proguard-rules.pro")
            if(!System.getenv("KEYSTORE_PATH").isNullOrBlank()&&!System.getenv("KEYSTORE_PASSWORD").isNullOrBlank()&&!System.getenv("KEY_ALIAS").isNullOrBlank()&&!System.getenv("KEY_PASSWORD").isNullOrBlank())
                signingConfig=signingConfigs.getByName("release")
        }
    }
}