import { useAuthContext } from "@asgardeo/auth-react";

export const SignInBtn = () => {

    const { signIn } = useAuthContext();

    return (
        <button onClick={ () => signIn() }>
            Sign In
        </button>
    );
};
