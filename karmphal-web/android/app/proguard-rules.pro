# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Preserve Capacitor Bridge, Plugins, and JavaScript Interfaces
-keep public class * extends com.getcapacitor.Plugin
-keep public class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Capacitor Bridge internals
-keepclassmembers class com.getcapacitor.Bridge {
    public *;
}

# Preserve Cordova compatibility classes if loaded
-keep public class * extends org.apache.cordova.CordovaPlugin

# Preserve annotations and JavascriptInterface attributes
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes SourceFile,LineNumberTable

# Suppress known warnings from transitive dependencies
-dontwarn com.getcapacitor.**
-dontwarn org.apache.cordova.**
