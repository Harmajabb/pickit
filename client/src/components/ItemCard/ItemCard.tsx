
import type { Announces } from "../itemHighlight/itemHighlight";
interface Props {
    data: Announces[]
}

function ItemCard({ data }: Props) {

    return (
        <>
        {data.map((item) => (
            <div key={item.id}><h3>{item.title}</h3>
            <p>{item.location}</p>

            </div>
        ))}
        </>
    )
}

export default ItemCard;