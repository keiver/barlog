import SwiftUI
import WatchKit

struct ContentView: View {
    @StateObject private var connectivityManager = WatchConnectivityManager.shared
    @StateObject private var model = NumberModel()
    @State private var rotationValue: Double = 0 // TODO: expose from RN
    @State private var showHelp: Bool = false
    @State private var displayLabel: String = "0"
    @State private var lastUpdateTimestamp: TimeInterval = 0
    @State private var unit: String = "lb"

    @FocusState private var isFocused: Bool

    let color = UIColor(red: 255.0 / 255.0, green: 183.0 / 255.0, blue: 3.0 / 255.0, alpha: 1.0)

    private func formattedWeight() -> String {
       let value = if unit == "kg" {
           // Convert lbs to kg and round to nearest 0.5
           round((rotationValue / 2.20462) * 2) / 2
       } else {
           // For lbs, round to nearest integer
           round(rotationValue)
       }
       return "\(Int(value)) \(unit)"
   }
    
    var body: some View {
        GeometryReader { geometry in
            VStack {
                Spacer()

                // Yellow number for target weight
                Text(formattedWeight())
                    .font(.system(size: 45))
                    .foregroundColor(Color(color))
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
                        isContinuous: true,
                        isHapticFeedbackEnabled: true
                    )
                    .onChange(of: rotationValue) { _ in
                        handleRotationChange()
                    }

                // Green text for logs
                if let logs = connectivityManager.receivedMessage["logs"] as? String {
                    Text(logs)
                        .font(.footnote)
                        .foregroundColor(.green)
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
                            Text("Info")
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

            if let l = message["label"] as? String {
                if l != "" {
                  displayLabel = l
                }
            }
          
          if let u = message["unit"] as? String {
              if u != "" {
                unit = u
              }
          }
        }
        .sheet(isPresented: $showHelp) {
            HelpView()
        }
    }

    // Reset action to send 95 back to the main app
    private func resetTo95() {
        rotationValue = 95
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

// Help View for info button
struct HelpView: View {
    var body: some View {
        VStack {
            Text("barlog")
                .font(.title)
                .multilineTextAlignment(.center)
                .padding(.bottom, 15)

            Text("In a barbell, what plates per side are needed to reach a weight?")
                .font(.body)
                .multilineTextAlignment(.center)
        }
    }
}

#Preview {
    ContentView()
}
