
type Props = {
    text: string
    btn_Type: 'submit' | 'reset' | 'button' | undefined
    classString: string
    disable: boolean
}

const Button = ({ text,btn_Type,classString,disable }: Props) => {
  return (
     <button disabled={disable} className={classString} type={btn_Type}>{text}</button>
  )
}

export default Button