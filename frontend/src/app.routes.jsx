import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Main from "./features/auth/pages/Main";
import { Protected } from "./features/auth/components/Protected";
import InterviewHome from "./features/interviewai/pages/InterviewHome";
import Interview from "./features/interviewai/pages/Interview";


export const router = createBrowserRouter([
    {
        path: "/",
        element:<Main/> 
    },
    {
        path: "/login",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path:"/generateresumereport",
        element:<Protected><InterviewHome/></Protected>
    },
    {
        path:'/interview/:interviewId',
        element:<Protected><Interview/></Protected>
    }
]);
