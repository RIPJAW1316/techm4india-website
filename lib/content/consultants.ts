/**
 * Consultant network shown on the landing page.
 *
 * Source: the consultant onboarding form responses supplied by the client
 * (27 responses, 26 Oct to 5 Nov 2026). Only the name, the current company
 * and the photograph are published. Job titles, contact details and ID
 * numbers from the form are deliberately left out.
 *
 * Photographs live in public/images/consultants/<id>.webp (portrait, about
 * 4:5). A person without a file yet is shown with their initials, so adding
 * a photo is the whole step: drop the file in with the matching id.
 *
 * Names and companies are title-cased from the form, with obvious brand
 * spellings fixed (TCS, HCLTech, TechM4India). Where the form said "NA" the
 * company is left out rather than guessed. "Cheruku Nikhil Goud" was typed
 * "Nikhi goud"; the LinkedIn handle on the same row reads "nikhil-cheruku".
 */

export type Consultant = {
  /** Also the photo's file name, without the extension. */
  id: string;
  name: string;
  /** Current company, as shown under the name. Left out when not given. */
  company?: string;
};

export const consultantPhoto = (id: string) => "/images/consultants/" + id + ".webp";

export const consultants: Consultant[] = [
  { id: "sirassu-ranjith", name: "Sirassu Ranjith", company: "TechM4India" },
  { id: "vadapally-nikhil-swaroop", name: "Vadapally Nikhil Swaroop", company: "Sutherland" },
  { id: "bothula-pavan-kalyan", name: "Bothula Pavan Kalyan", company: "Randstad" },
  { id: "sirassu-rashmi", name: "Sirassu Rashmi", company: "Abacus Pvt Ltd" },
  { id: "vineeth", name: "Vineeth", company: "The Ramco Cements" },
  { id: "srideep-kuncham", name: "Srideep Kuncham", company: "HCLTech" },
  { id: "akhil-sura", name: "Akhil Sura", company: "Aceprobe Technology" },
  { id: "venkata-prem-sai", name: "Venkata Prem Sai", company: "Infinite" },
  { id: "cheruku-nikhil-goud", name: "Cheruku Nikhil Goud", company: "Pirnov Technology" },
  { id: "saikumar", name: "Saikumar", company: "TCS" },
  { id: "sevarthi-uttam-kumar", name: "Sevarthi Uttam Kumar", company: "Cognizant" },
  { id: "thanneeru-pranay", name: "Thanneeru Pranay", company: "TechM4India" },
  { id: "sumanth-gopishetti", name: "Sumanth Gopishetti", company: "ELIX-R" },
  { id: "ponaganti-shashank", name: "Ponaganti Shashank", company: "Cotiviti" },
  { id: "peta-sumantha", name: "Peta Sumantha", company: "Genpact" },
  { id: "meruga-taraka-srinivas", name: "Meruga Taraka Srinivas", company: "TGCSB" },
  { id: "sainandhan-jilla", name: "Sainandhan Jilla", company: "RealPage" },
  { id: "abhilash-goud-ranam", name: "Abhilash Goud Ranam", company: "TCS" },
  { id: "sindhuri-bairi", name: "Sindhuri Bairi" },
  { id: "boda-anji-reddy", name: "Boda Anji Reddy", company: "Jarsh Innovations Private Limited" },
  { id: "raguveer-reddy", name: "Raguveer Reddy", company: "Aspirefit" },
  { id: "yarneni-bala-praneeth-sagar", name: "Yarneni Bala Praneeth Sagar" },
  { id: "tr-divyakanth", name: "TR Divyakanth", company: "Tractrix Optodynamix" },
  { id: "e-vamsi-krishna", name: "E Vamsi Krishna", company: "TechM4India" },
  { id: "madipeddi-shiva-shankar", name: "Madipeddi Shiva Shankar", company: "Deloitte" },
  { id: "jujjavrapu-tapaswi", name: "Jujjavrapu Tapaswi", company: "WTX India" },
  { id: "soma-harshith-reddy", name: "Soma Harshith Reddy", company: "Cognizant" },
];
