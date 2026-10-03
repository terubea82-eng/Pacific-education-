package fj.pacificeducation.app;

import android.content.Intent;
import android.net.VpnService;
import android.os.IBinder;
/**
 * Pacific Education Secure Tunnel (PEST) native boundary.
 * A real tunnel requires an approved endpoint/protocol and carrier configuration.
 */
public final class PacificEducationSecureTunnelService extends VpnService {
    public static final String ACTION_START = "fj.pacificeducation.app.PEST_START";
    public static final String ACTION_STOP = "fj.pacificeducation.app.PEST_STOP";

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopSelf();
            return START_NOT_STICKY;
        }
        // Do not establish a non-functional VPN. Keep normal connectivity or
        // offline-first operation until an approved endpoint is provisioned.
        return START_NOT_STICKY;
    }

    @Override public IBinder onBind(Intent intent) { return super.onBind(intent); }
}
