"use client";

import {
    MessageSquare,
    Smile,
    Clock3,
    Flag
} from "lucide-react";

export default function FeedbackSummary(){

const cards=[
{
title:"Total Feedback",
value:"1,254",
icon:<MessageSquare size={32}/>,
color:"text-blue-600"
},
{
title:"Positive",
value:"903",
icon:<Smile size={32}/>,
color:"text-green-600"
},
{
title:"Pending Review",
value:"64",
icon:<Clock3 size={32}/>,
color:"text-yellow-500"
},
{
title:"Flagged",
value:"17",
icon:<Flag size={32}/>,
color:"text-red-500"
}
];

return(

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

{cards.map(card=>(

<div
key={card.title}
className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-xl"
>

<div className="flex justify-between">

<div>

<p className="text-sm text-slate-500">
{card.title}
</p>

<h2 className="mt-3 text-3xl font-bold">
{card.value}
</h2>

</div>

<div className={card.color}>
{card.icon}
</div>

</div>

</div>

))}

</div>

);

}