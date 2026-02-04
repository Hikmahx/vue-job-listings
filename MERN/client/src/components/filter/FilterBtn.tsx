import removeIcon from '../../assets/img/icon-remove.svg';

interface FilterBtnProps {
  btns: string[];
  removeBtn: (btn: string) => void;
}

const FilterBtn = ({ btns, removeBtn }: FilterBtnProps) => {
  return (
    <>
      {btns.map((btn, index) => (
        <button
          key={index}
          className="flex items-center gap-2 bg-cyan-50 text-cyan-400 font-semibold rounded-md overflow-hidden capitalize"
        >
          <span className="px-2">{btn}</span>
          <span
            className="bg-teal-600 hover:bg-cyan-400 p-2 cursor-pointer flex items-center justify-center"
            onClick={() => removeBtn(btn)}
          >
            <img src={removeIcon} alt="Remove" className="w-3 h-3" />
          </span>
        </button>
      ))}
    </>
  );
};

export default FilterBtn;
