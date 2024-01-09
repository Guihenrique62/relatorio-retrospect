import {createBrowserRouter} from "react-router-dom"
import Grafico from "./grafico"
import Upload from "./upload"

const router = createBrowserRouter([
    {path: '/', element: <Upload/>, },
    {path: 'graphic', element: <Grafico/>}
])


export default router