import SwiftUI
import WatchKit

struct ContentView: View {
    @StateObject private var connectivityManager = WatchConnectivityManager.shared
    @StateObject private var model = NumberModel()
    @State private var rotationValue: Double = 0
    @State private var showHelp: Bool = false
    @State private var displayLabel: String = "0"
    @State private var lastUpdateTimestamp: TimeInterval = 0
    @State private var unit: String = "lb"
    @State private var lastLogs: String? = nil

    @FocusState private var isFocused: Bool

    let yellow = UIColor(red: 255.0 / 255.0, green: 183.0 / 255.0, blue: 3.0 / 255.0, alpha: 1.0)
    let green = UIColor(red: 0.0 / 255.0, green: 255.0 / 255.0, blue: 0.0 / 255.0, alpha: 1.0)

    var body: some View {
        GeometryReader { geometry in
            VStack {
                Spacer()

                // Yellow number for target weight
                Text(displayLabel)
                    .font(.system(size: 45))
                    .foregroundColor(Color(yellow))
                    .frame(maxWidth: .infinity)
                    .focusable(true)
                    .focused($isFocused)
                    .shadow(radius: 5)
                    .digitalCrownRotation(
                        $rotationValue,
                        from: 0,
                        through: 800,
                        by: 1,
                        sensitivity: .medium,
                        isContinuous: false,
                        isHapticFeedbackEnabled: true
                    )
                    .onChange(of: rotationValue) { _ in
                        handleRotationChange()
                    }
                    // Add modern haptics if available
                    .modifier(SensoryFeedbackModifier(value: rotationValue))

                // Green text for logs
                if let logs = lastLogs {
                    Text(logs)
                        .font(.footnote)
                        .foregroundColor(Color(green))
                        .padding(10)
                        .font(.body)
                        .multilineTextAlignment(.center)
                        .padding(.top, 4)

                    // Actions under logs
                    HStack(spacing: 20) {
                        // Reset button
                        Button(action: resetTo95) {
                            Text("Reset")
                                .font(.caption2)
                                .foregroundColor(.blue)
                        }
                        .padding(.top, 12)

                        // Info button
                        Button(action: { showHelp.toggle() }) {
                            Image(systemName: "questionmark.circle")
                                .font(.caption2)
                                .foregroundColor(.blue)
                        }
                        .padding(.top, 12)
                    }
                    .padding(.horizontal, 17)
                } else {
                    Text("Open app to see plates")
                        .padding(10)
                        .font(.body)
                        .multilineTextAlignment(.center)
                }

                Spacer()

                // Phone connectivity status
                if !connectivityManager.isReachable {
                    Text("Phone Not Connected")
                        .font(.footnote)
                        .foregroundColor(.red)
                        .padding(.bottom, 4)
                }
            }
            .frame(width: geometry.size.width)
        }
        .edgesIgnoringSafeArea(.all)
        .onAppear {
            isFocused = true
        }
        .onReceive(connectivityManager.$receivedMessage) { message in
            if let weight = message["weight"] as? Double {
                if weight > 0 {
                    rotationValue = weight
                }
            }

            if let l = message["label"] as? String, !l.isEmpty {
                displayLabel = l
            }

            if let u = message["unit"] as? String {
                unit = u
            }

            if let logs = message["logs"] as? String {
                lastLogs = logs
            }
        }
        .sheet(isPresented: $showHelp) {
            HelpView()
        }
    }

    // Reset action to send 95 back to the main app
    private func resetTo95() {
        rotationValue = 0
        connectivityManager.sendNumberToPhone(95) { error in
            if let error = error {
                print("Watch: Failed to send reset number: \(error.localizedDescription)")
            }
        }
    }

    // Handle rotation change and debounce updates
    private func handleRotationChange() {
        let value = Int(rotationValue)
        let now = Date().timeIntervalSince1970

        if now - lastUpdateTimestamp < 0.3 { // 300ms throttle
            return
        }

        lastUpdateTimestamp = now
        connectivityManager.sendNumberToPhone(value) { error in
            if let error = error {
                print("Watch: Failed to send number: \(error.localizedDescription)")
            } else {
                print("Watch: Successfully sent number \(value) to phone")
            }
        }
    }
}

// Modifier to handle sensory feedback availability
struct SensoryFeedbackModifier: ViewModifier {
    let value: Double
    
    func body(content: Content) -> some View {
        if #available(watchOS 10.0, *) {
            content.sensoryFeedback(.selection, trigger: value)
        } else {
            content
        }
    }
}

// Help View for info button
struct HelpView: View {
  private var appVersion: String {
         let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
         let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown"
         return "Version \(version) (\(build))"
     }
  
    var body: some View {
        VStack {
            Text("barlog")
                .font(.title)
                .multilineTextAlignment(.center)
                .padding(.bottom, 5)

            Text("What barbell plates per side do I need to reach a target weight?")
               .font(.body)
               .multilineTextAlignment(.center)
               .lineLimit(nil)
               .minimumScaleFactor(0.5)
               .frame(maxWidth: .infinity)
          
          Text(appVersion)
                .font(.footnote)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.top, 10)
        }
    }
}

#Preview {
    ContentView()
}
