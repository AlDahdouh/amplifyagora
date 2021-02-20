import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
// import { withAuthenticator, AmplifyTheme } from "aws-amplify-react";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { Auth, Hub } from "aws-amplify";
import HomePage from "./pages/HomePage";
import MarketPage from "./pages/MarketPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/Navbar";

export const UserContext = React.createContext();

class App extends React.Component {
  state = {
    user: null,
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this, "onHubCapsule");
  }

  onHubCapsule = (capsule) => {
    console.log(capsule.payload.event);
    switch (capsule.payload.event) {
      case "signIn":
        this.getUserData();
        break;
      case "signUp":
        break;
      case "signOut":
        this.setState({ user: null });
        break;
      default:
        return;
    }
  };

  getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user ? this.setState({ user }) : this.setState({ user: null });
  };

  oxSignOut = async () => {
    try {
      const result = await Auth.signOut();
      this.setState({ user: null });
    } catch (err) {
      console.error(err);
    }
  };
  render() {
    const { user } = this.state;
    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <UserContext.Provider value={{ user }}>
        <Router>
          <>
            <Navbar user={user} oxSignOut={this.oxSignOut} />
            <div className="app-container">
              <Route exact path="/" component={HomePage} />
              <Route path="/profile" component={ProfilePage} />
              <Route
                path="/market/:marketId"
                component={({ match }) => (
                  <MarketPage user={user} marketId={match.params.marketId} />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
    );
  }
}

// }
// const App = () => {
//   const [user, setUser] = useState({});

//   if (!user) {
//     return <Authenticator theme={theme} />;
//   } else {
//     return <div>App</div>;
//   }
// };

const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: "green",
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: "3em",
  },
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: "#ffc0cb",
  },
};

// export default withAuthenticator(App, true, [], null, theme);
export default App;
