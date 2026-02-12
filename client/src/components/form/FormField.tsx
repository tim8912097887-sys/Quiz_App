
type Props = {
    typeString: "email" | "password" | "text"
    text: string
    labelString: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    value: string
}

const FormField = ({ labelString,text,typeString,onChange,value }: Props) => {
  return (
    <div className="flex flex-col gap-1">
        <label className="cursor-pointer font-semibold text-2xl" htmlFor={labelString}>{text}</label>
        <input className="px-4 py-3 rounded-[99999px]" type={typeString} id={labelString} name={labelString} onChange={onChange} value={value} />
    </div>
  )
}

export default FormField