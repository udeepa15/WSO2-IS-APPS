import { useAuthContext } from "@asgardeo/auth-react";

export const HomePage = () => {

    const { signOut } = useAuthContext();

    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <p>This is the content of the home page.</p>
            <button onClick={ () => signOut() }>
                Sign Out
            </button>
        </div>
    );
}
