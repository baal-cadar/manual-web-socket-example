const manualWebSocket = require("manual-web-socket");

describe("WebSocket Application", () => {
  it("Connect, send and receive message, receive message, close", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        var script = win.document.createElement("script");
        script.innerText = manualWebSocket.getScript();
        win.document.head.appendChild(script);
        win.mws.track(["ws://127.0.0.1:3030"]);
      }
    }).then(win => {
      let trackedConnection;

      win.mws.when("ws://127.0.0.1:3030").then(connection => {
        trackedConnection = connection;
        trackedConnection.readyState = win.mws.readyState.OPEN;
      });

      cy.get("#label")
        .should($el => {
          expect($el).to.contain("not connected");
        })
        .get("#connect")
        .click()
        .get("#label")
        .should($el => {
          expect($el).to.contain("connected");
        });

      cy.get("#input")
        .type("ping")
        .then(() => {
          trackedConnection.addServerScenario("ping", (connection, message) => {
            connection.reciveMessage(message + " pong");
          });

          cy.get("#submit")
            .click()
            .get("#messages")
            .should($el => {
              expect($el).to.contain("pong");
            });
        })
        .then(() => {
          trackedConnection.reciveMessage("another message");
          cy.get("#messages").should($el => {
            expect($el).to.contain("another message");
          });
        })
        .then(() => {
          trackedConnection.readyState = win.mws.readyState.CLOSED;
          cy.get("#label").should($el => {
            expect($el).to.contain("closed");
          });
        });
    });
  });
});
