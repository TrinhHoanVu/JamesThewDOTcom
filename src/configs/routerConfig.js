import Login from "../components/account/login"
import PrivateContest from "../components/contest/privatecontest"
import Home from "../components/home"
import ForgotPassword from "../components/account/forgotpassword"
import SignUp from "../components/account/signup"
import ResetPassword from "../components/account/resetpassword"
import VerifyCode from "../components/account/verifyCode"
import Management from "../components/management/management"
import PublicContest from "../components/contest/public-contest"
import ContestDetail from "../components/contest/contest-detail"
import PaymentConfirmation from "../components/account/payment-success"
import AttendeesDetail from "../components/contest/attendees-detail"

const publicRouter = [
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/confirmcode",
        element: <VerifyCode />
    },
    {
        path: "/resetpassword",
        element: <ResetPassword />
    },
    {
        path: "/sign-up",
        element: <SignUp />
    },
    {
        path: "/publiccontest",
        element: <PublicContest />
    },
    {
        path: "/contest/:id",
        element: <ContestDetail />
    },
    {
        path: "/success",
        element: <PaymentConfirmation />
    },
    {
        path: "/contest/:contestId/attendees",
        element: <AttendeesDetail />
    }
]


const privateRouter = [
    {
        path: "/privatecontest",
        element: <PrivateContest />,
        roles: ["USER", "ADMIN", "SUPERADMIN"],
        status: true
    },
    {
        path: "/management",
        element: <Management defaultTab="profile" />,
        roles: ["ADMIN", "SUPERADMIN", "USER"],
        status: true
    }
]
export {
    publicRouter,
    privateRouter
}