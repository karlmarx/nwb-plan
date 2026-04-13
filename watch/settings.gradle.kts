pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolution {
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "nwb-watch"
include(":app")    // Wear OS watch app
include(":phone")  // Phone companion app
