//
//  ContentView.swift
//  PartnerSync
//
//  Created by Semih Erden on 25.04.25.
//

import SwiftUI

struct ContentView: View {
    @State private var authenticated = false
    @State private var paired = false

    var body: some View {
        VStack {
            if !authenticated {
                AuthView { authenticated = true }
            } else if !paired {
                PairView { paired = true }
            } else {
                ChatView()
            }
        }
        .frame(minWidth: 300, minHeight: 200)
    }
}

#Preview {
    ContentView()
}
