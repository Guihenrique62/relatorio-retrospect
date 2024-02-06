import {createBrowserRouter} from "react-router-dom"
import Grafico from "./grafico"
import Upload from "./upload"
import Dashboard from "./Dashboard"

const router = createBrowserRouter([
    {path: '/', element: <Dashboard/>, },
    {path: 'upload', element: <Upload/>},
    {path: 'graphic', element: <Grafico/>}
])


export default router