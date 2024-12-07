import WatchConnectivity
import Foundation

class WatchConnectivity: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivity()
    private let session: WCSession
    private var messageQueue: [(Int, Date)] = []
    private var isProcessingQueue = false
    private var activationState: WCSessionActivationState = .notActivated
    
    override init() {
        self.session = WCSession.default
        super.init()
        
        if WCSession.isSupported() {
            print("Watch: Setting up WCSession...")
            session.delegate = self
            session.activate()
        } else {
            print("Watch: WCSession is not supported")
        }
    }
    
    static func sendNumberToPhone(_ number: Int) {
        shared.queueMessage(number: number)
    }
    
    private func queueMessage(number: Int) {
        messageQueue.append((number, Date()))
        
        if activationState == .activated && session.isReachable {
            processMessageQueue()
        } else {
            print("Watch: Session not ready (State: \(activationState.rawValue), Reachable: \(session.isReachable)). Queued messages: \(messageQueue.count)")
        }
    }
    
    private func processMessageQueue() {
        guard !isProcessingQueue else { return }
        guard activationState == .activated else {
            print("Watch: Cannot process queue - session not activated")
            return
        }
        guard session.isReachable else {
            print("Watch: Cannot process queue - phone not reachable")
            return
        }
        
        isProcessingQueue = true
        
        // Process only the latest message within a 500ms window
        let cutoff = Date().addingTimeInterval(-0.5)
        let recentMessages = messageQueue.filter { $0.1 > cutoff }
        
        if let lastMessage = recentMessages.last {
            print("Watch: Sending number \(lastMessage.0) to phone")
            
            let message = ["number": lastMessage.0]
            session.sendMessage(message, replyHandler: { reply in
                print("Watch: Message sent successfully with reply: \(reply)")
            }) { error in
                print("Watch: Failed to send message: \(error.localizedDescription)")
            }
        }
        
        messageQueue.removeAll()
        isProcessingQueue = false
    }
    
    // MARK: - WCSessionDelegate
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async { [weak self] in
            if let error = error {
                print("Watch: Session activation failed: \(error.localizedDescription)")
                return
            }
            
            self?.activationState = activationState
            print("Watch: Session activation state changed to: \(activationState.rawValue)")
            
            switch activationState {
            case .activated:
                print("Watch: Session is now activated")
                self?.processMessageQueue()
            case .inactive:
                print("Watch: Session is now inactive")
            case .notActivated:
                print("Watch: Session is not activated")
            @unknown default:
                print("Watch: Unknown session state")
            }
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
        print("Watch: Received message: \(message)")
        replyHandler(["status": "received"])
    }
    
    func sessionReachabilityDidChange(_ session: WCSession) {
        print("Watch: Reachability changed. Is reachable: \(session.isReachable)")
        if session.isReachable && activationState == .activated {
            processMessageQueue()
        }
    }
}
