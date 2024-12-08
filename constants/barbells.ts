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
    kg: 20.4,
    label: "US Olympic Bar",
    description: "US standard Olympic weightlifting bar",
  },
  {
    id: "2",
    lbs: 44,
    kg: 20,
    label: "International Olympic Bar",
    description: "International standard Olympic weightlifting bar",
  },
  {
    id: "3",
    lbs: 35,
    kg: 15.9,
    label: "Women's Olympic Bar",
    description: "Standard women's Olympic weightlifting bar",
  },
  {
    id: "4",
    lbs: 33,
    kg: 15,
    label: "Metric Training Bar",
    description: "Common metric standard training bar",
  },
  {
    id: "5",
    lbs: 22,
    kg: 10,
    label: "Heavy Training Bar",
    description: "Heavier training bar for progressive loading",
  },
  {
    id: "6",
    lbs: 20,
    kg: 9.1,
    label: "Standard Training Bar",
    description: "Common training bar for general use and skill development",
  },
  {
    id: "7",
    lbs: 18,
    kg: 8.2,
    label: "Training Bar",
    description: "Lightweight training bar for beginners and technique work",
  },
  {
    id: "8",
    lbs: 17,
    kg: 7.7,
    label: "Junior Bar",
    description: "Youth training bar for beginners and young athletes",
  },
  {
    id: "9",
    lbs: 15,
    kg: 6.8,
    label: "Technique Bar",
    description: "Lightweight aluminum bar for learning form and technique",
  },
];

export default barbellWeights;
