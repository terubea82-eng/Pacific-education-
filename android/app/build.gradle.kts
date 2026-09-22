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
        versionCode = 1
        versionName = "1.0.0-pilot"
    }

    buildFeatures {\n        buildConfig = true\n    }\n\n    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}
