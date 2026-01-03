import Login from '@/components/auth/login';
import { auth } from '@/auth';
const LoginPage = async () => {
    const session = await auth();

    return (
        <Login />
    )
}

export default LoginPage;