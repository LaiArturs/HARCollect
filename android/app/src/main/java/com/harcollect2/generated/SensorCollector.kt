package com.harcollect2.generated

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
import java.util.*
import kotlin.collections.ArrayList
import android.content.Context
import android.os.PowerManager
import android.os.SystemClock
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter

data class DataPoint(val x: Float = 0F, val y: Float = 0F, val z: Float = 0F, val time: Int = 0, val sensor: Char = '0') {
    override fun toString(): String {
        return "%c;%d;%.4f;%.4f;%.4f".format(sensor, time, x, y, z)
    }
}

//data class DataPoint(val x: Float = 0F, val y: Float = 0F, val z: Float = 0F, val time: Int = 0) {
//    override fun toString(): String {
//        return "%d,%.4f,%.4f,%.4f".format(time, x, y, z)
//    }
//}

//data class DataPoint(val x: Float = 0F, val y: Float = 0F, val z: Float = 0F, val sensor: Char = '0') {
//    override fun toString(): String {
//        return "%c,%.4f,%.4f,%.4f".format(sensor, x, y, z)
//    }
//}

class SensorCollector(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), SensorEventListener {

    private var sensorManager: SensorManager = reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private var accelSensor: Sensor? = null

    private var gyroSensor: Sensor? = null
    private var running: Boolean = false
    private var fileName: String = ""
    private var data = mutableListOf<DataPoint>()
    private var ctx = reactContext
    private var startTime: Long = 0
    private var wakeLock: PowerManager.WakeLock = (reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager).run {
        newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag")
    }


    init {
        var accelList = sensorManager.getSensorList(Sensor.TYPE_LINEAR_ACCELERATION)
        var gyroList = sensorManager.getSensorList(Sensor.TYPE_GYROSCOPE)
        accelList?.let {
            if (it.isNotEmpty())
                accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION, true)
            if (accelSensor == null) {
                accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
            }
        }
        gyroList?.let {
            if (gyroList.isNotEmpty())
                gyroSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        }

    }

    override fun getName(): String {
        return "KotlinSensorCollector"
    }

    @ReactMethod
    fun start(fn: String, frequency: Int, cb: Callback) {
        if (running) return
        fileName = fn
        startTime = SystemClock.elapsedRealtimeNanos()
        if (accelSensor != null)
            sensorManager.registerListener(this, accelSensor, 1000000 / frequency)
        if (gyroSensor != null)
            sensorManager.registerListener(this, gyroSensor, 1000000 / frequency)
        wakeLock.acquire()
        cb.invoke()
        running = true
    }

    @ReactMethod
    fun stop(cb: Callback) {
        if (!running) return
        sensorManager.unregisterListener(this)
        var file = BufferedWriter(FileWriter(File(ctx.filesDir, fileName)))
        data.forEach {
            file.write(it.toString() + "\n")
        }
        data.clear()
        file.close()
        wakeLock.release()
        cb.invoke()
        running = false
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        return
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor == null || event.timestamp < startTime) return
        var type: Char = '0'
        if (event.sensor?.type == Sensor.TYPE_GYROSCOPE) type = 'G'
        else if (event.sensor?.type == Sensor.TYPE_LINEAR_ACCELERATION) type = 'A'
//        if (event?.sensor?.type != Sensor.TYPE_LINEAR_ACCELERATION) return;
        data.add(DataPoint(event.values[0], event.values[1], event.values[2], ((event.timestamp - startTime) / 1000000).toInt(), type))
        // Timestamp is in nanoseconds
    }

}

class SensorPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        val modules = ArrayList<NativeModule>()
        modules.add(SensorCollector(reactContext))
        return modules
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return Collections.emptyList()
    }
}