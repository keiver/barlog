type BarbellWeight = {
  id: string;
  lbs: number;
  kg: number;
  label: string;
  description: string;
};

const barbellWeights: BarbellWeight[] = [
  {
    id: "1",
    lbs: 45,
    kg: 20,
    label: "45lb Olympic Bar",
    description: "Standard 45lb Olympic weightlifting bar",
  },
  {
    id: "2",
    lbs: 35,
    kg: 15.9,
    label: "35lb Olympic Bar",
    description: "Standard 35lb Olympic weightlifting bar",
  },
  {
    id: "3",
    lbs: 33,
    kg: 15,
    label: "33lb Training Bar",
    description: "Standard training bar",
  },
];

export default barbellWeights;
