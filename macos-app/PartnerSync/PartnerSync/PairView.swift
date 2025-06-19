import SwiftUI

struct PairView: View {
    @State private var code: String = ""
    var onPair: (() -> Void)?

    var body: some View {
        VStack(spacing: 12) {
            Button("Generate Code") {
                code = String(Int.random(in: 100000...999999))
                // TODO: save code via backend
            }
            HStack {
                TextField("Code", text: $code)
                    .textFieldStyle(.roundedBorder)
                Button("Join") {
                    // TODO: join partner via backend
                    onPair?()
                }
            }
        }
        .padding()
    }
}

#Preview {
    PairView()
}
