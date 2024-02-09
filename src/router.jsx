import {createBrowserRouter} from "react-router-dom"
import Grafico from "./pages/Grafico"
import Upload from "./upload"
import Dashboard from "./pages/Dashboard"
import RouterLayout from "./pages/RouterLayout"

const router = createBrowserRouter([
    {path: '/', element: <RouterLayout/>, children:[
        {index: true, element: <Dashboard/>},
        {path: 'graphic/:userName',element: <Grafico/>},
    ] },
    {path: 'upload', element: <Upload/>},
])


export default router