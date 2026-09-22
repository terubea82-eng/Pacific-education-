plugins {
    id("com.android.application")
}

android {
    namespace = "org.pacificeducation.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "org.pacificeducation.app"
        minSdk = 23
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1"
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("KEYSTORE_PATH")
            val keystorePassword = System.getenv("KEYSTORE_PASSWORD")
            val keyAlias = System.getenv("KEY_ALIAS")
            val keyPassword = System.getenv("KEY_PASSWORD")

            if (!keystorePath.isNullOrBlank() &&
                !keystorePassword.isNullOrBlank() &&
                !keyAlias.isNullOrBlank() &&
                !keyPassword.isNullOrBlank()
            ) {
                storeFile = file(keystorePath)
                storePassword = keystorePassword
                this.keyAlias = keyAlias
                this.keyPassword = keyPassword
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false

            val keystorePath = System.getenv("KEYSTORE_PATH")
            val signingReady =
                !keystorePath.isNullOrBlank() &&
                !System.getenv("KEYSTORE_PASSWORD").isNullOrBlank() &&
                !System.getenv("KEY_ALIAS").isNullOrBlank() &&
                !System.getenv("KEY_PASSWORD").isNullOrBlank()

            if (signingReady) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }
}
