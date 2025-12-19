import { useEffect, useState} from "react"
import type {Announces} from "./itemHighlight.ts"
import ItemCard from "../ItemCard/ItemCard.tsx"
import "./itemHighlight.css"
function ItemHighlight() {
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error,setError] = useState<Error | null>(null)
const [data,setData] = useState <Announces []>([])

useEffect(() => {
 const announcesFiltered = async () => {
    try{
        const data = await fetch(`${import.meta.env.VITE_API_URL}/api/announcesFiltered`);
        if (!data.ok){
            throw new Error(`Èrror HTTP: ${data.status}`)
        }
        const jsonData = await data.json();
        setData(jsonData)

    } catch (e) {
        setError(e as Error);
    } finally {
        setIsLoading(false)
    }
    
}
  announcesFiltered()
},[]);
return (
    <>
    <header className="itemCard-title">
        <h2>Our featured listing</h2>
    </header>
  <div className="ItemHighlight-container">{data.map((item) => (<ItemCard key={item.id} id={item.id} title={item.title} location={item.location} all_images={item.all_images}/>))}</div>
  </>
)
}

export default ItemHighlight;