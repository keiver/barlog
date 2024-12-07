import WatchConnectivity

class WatchConnectivityManager: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()
    
    private override init() {
        super.init()
    }

    // Setup the WCSession
    func setupSession() {
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
            print("WCSession setup and activated")
        } else {
            print("WCSession is not supported on this device")
        }
    }

    // MARK: - WCSessionDelegate

    // Called when the session state changes
    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("WCSession activation failed with error: \(error.localizedDescription)")
            return
        }

        print("WCSession activated with state: \(state.rawValue)")

        // Check the current application context
        if let context = session.receivedApplicationContext as? [String: Any] {
            print("Initial received application context: \(context)")
        } else {
            print("No initial application context available.")
        }
    }

    // Called when the app receives new application context data
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        print("Updated application context received: \(applicationContext)")
        
        // Handle the received context data here
    }

    // Required for WCSessionDelegate but not used in this example
    func sessionDidBecomeInactive(_ session: WCSession) {
        print("WCSession did become inactive")
    }

    func sessionDidDeactivate(_ session: WCSession) {
        print("WCSession did deactivate")

        // Reactivate session if needed
        session.activate()
    }
}

// Usage Example
// Call this in your app's initialization process, like in AppDelegate or SceneDelegate
WatchConnectivityManager.shared.setupSession()
