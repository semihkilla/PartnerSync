import SwiftUI

struct ChatView: View {
    @State private var messages: [String] = []
    @State private var text: String = ""

    var body: some View {
        VStack {
            List(messages, id: \.self) { msg in
                Text(msg)
            }
            HStack {
                TextField("Message", text: $text)
                Button("Send") {
                    guard !text.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                    messages.append(text)
                    text = ""
                    // TODO: integrate Firebase Firestore
                }
            }
            .padding()
        }
        .frame(minWidth: 300, minHeight: 200)
    }
}

#Preview {
    ChatView()
}
