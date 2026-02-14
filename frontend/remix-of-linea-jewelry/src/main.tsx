import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const app = <App />;

createRoot(document.getElementById("root")!).render(
	googleClientId ? (
		<GoogleOAuthProvider clientId={googleClientId}>
			{app}
		</GoogleOAuthProvider>
	) : (
		app
	)
);
