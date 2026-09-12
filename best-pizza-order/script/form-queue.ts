import { supabase } from "@/lib/supabase"
interface Participant {
  id: string; // or number, depending on your DB
  rows: string | number; // the column you are checking for unique values
  [key: string]: any;
}

async function getAllUsers(): Promise<Participant[] | null> {
  const { data, error } = await supabase
    .from('participants') 
    .select() 
  
  if (error) {
    console.error('Error fetching data:', error)
    return null
  }
  
  console.log(data)
  return data as Participant[]
}
  
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  // Create a shallow copy to avoid mutating the original array
  const shuffled = [...array]; 
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

function getRowLabel(index: number) {
  let label = "";
  index += 1;
  while (index > 0) {
    const remainder = (index - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    index = Math.floor((index - 1) / 26);
  }
  return label;
}
function getSectionName(index: number): string {
    const sections = ["left", "center", "right"];
    // Returns "left" for 0, "center" for 1, "right" for 2
    return sections[index] ?? "unknown"; 
}

// Converted to async to await the user data
export async function formQueue(): Promise<string[]> {
  const users = await getAllUsers();
  
  // Guard clause in case the fetch fails
  if (!users) {
      console.error("No users found to build the queue.");
      return [];
  }

  const totalSections = 3;
  
  // Mapping the array to just the "rows" values, putting them in a Set (which removes duplicates), and getting the size.
  const totalRows = new Set(users.map(user => user.rows)).size;
  
  const maxPossibleCombinations = totalSections * totalRows;
  const buildQueue: string[] = [];

  for (let sectionIndex = 0; sectionIndex < totalSections; sectionIndex++) {
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
      // GAP FILLED: Constructing the string format. 
      // Using template literals to combine the section (1-indexed) and the row label (A, B, C, etc.)
      buildQueue.push(`${getSectionName(sectionIndex)}-${getRowLabel(rowIndex)}`);
    }
  }   

  // then shuffle
  return shuffleArray(buildQueue);
}