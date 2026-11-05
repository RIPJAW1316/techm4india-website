/**
 * Consultant network shown on the landing page.
 *
 * Source: the consultant onboarding form responses supplied by the client
 * (27 responses, 26 Oct to 5 Nov 2026). Published: name, job title, current
 * company and photograph. Contact details and ID numbers from the form are
 * deliberately left out.
 *
 * Order (client request): best-known employers first, then smaller companies,
 * then TechM4India's own team, then anyone with no company given. Within one
 * company, people who have a photo come first. Anyone still without a photo
 * goes at the very end. To change the order, move a line; the numbering on
 * the page follows it.
 *
 * Photographs live in public/images/consultants/<id>.webp (portrait, about
 * 4:5). A person without a file yet is shown with their initials, so adding
 * a photo is the whole step: drop the file in with the matching id.
 *
 * Names, titles and companies are title-cased from the form, with obvious
 * brand spellings fixed (TCS, HCLTech, TechM4India, AI). Where the form said
 * "NA" the field is left out rather than guessed. "Cheruku Nikhil Goud" was
 * typed "Nikhi goud"; the LinkedIn handle on the same row reads
 * "nikhil-cheruku".
 */

export type Consultant = {
  /** Also the photo's file name, without the extension. */
  id: string;
  name: string;
  /** Current job title, as given on the form. Left out when not given. */
  role?: string;
  /** Current company, shown under the name. Left out when not given. */
  company?: string;
};

export const consultantPhoto = (id: string) => "/images/consultants/" + id + ".webp";

export const consultants: Consultant[] = [
  // Best-known employers
  { id: "madipeddi-shiva-shankar", name: "Madipeddi Shiva Shankar", role: "NOC Engineer", company: "Deloitte" },
  { id: "abhilash-goud-ranam", name: "Abhilash Goud Ranam", role: "System Engineer", company: "TCS" },
  { id: "sevarthi-uttam-kumar", name: "Sevarthi Uttam Kumar", role: "Platform Developer", company: "Cognizant" },
  { id: "soma-harshith-reddy", name: "Soma Harshith Reddy", role: "Programmer Analyst", company: "Cognizant" },
  { id: "srideep-kuncham", name: "Srideep Kuncham", role: "Senior Associate Software Engineer", company: "HCLTech" },
  { id: "peta-sumantha", name: "Peta Sumantha", role: "Process Developer", company: "Genpact" },
  { id: "vineeth", name: "Vineeth", role: "Software Developer", company: "The Ramco Cements" },
  { id: "bothula-pavan-kalyan", name: "Bothula Pavan Kalyan", role: "Senior Associate Software Engineer", company: "Randstad" },
  { id: "vadapally-nikhil-swaroop", name: "Vadapally Nikhil Swaroop", role: "Senior Associate Engineer", company: "Sutherland" },
  { id: "ponaganti-shashank", name: "Ponaganti Shashank", role: "Software Engineer I", company: "Cotiviti" },
  { id: "sainandhan-jilla", name: "Sainandhan Jilla", role: "Developer Analyst", company: "RealPage" },
  { id: "venkata-prem-sai", name: "Venkata Prem Sai", role: "Associate Software Engineer", company: "Infinite" },
  { id: "meruga-taraka-srinivas", name: "Meruga Taraka Srinivas", role: "Information Security Associate Intern", company: "TGCSB" },
  // Other companies
  { id: "cheruku-nikhil-goud", name: "Cheruku Nikhil Goud", role: "Associate Software Engineer", company: "Pirnov Technology" },
  { id: "akhil-sura", name: "Akhil Sura", role: "Assistant Manager", company: "Aceprobe Technology" },
  { id: "sumanth-gopishetti", name: "Sumanth Gopishetti", role: "Marketing Manager", company: "ELIX-R" },
  { id: "sirassu-rashmi", name: "Sirassu Rashmi", role: "Business Development Executive", company: "Abacus Pvt Ltd" },
  { id: "boda-anji-reddy", name: "Boda Anji Reddy", role: "Junior Design Engineer", company: "Jarsh Innovations Private Limited" },
  { id: "tr-divyakanth", name: "TR Divyakanth", role: "Jr Engineer (Opto Electronics Engineer)", company: "Tractrix Optodynamix" },
  { id: "raguveer-reddy", name: "Raguveer Reddy", role: "Co-founder", company: "Aspirefit" },
  { id: "jujjavrapu-tapaswi", name: "Jujjavrapu Tapaswi", role: "AI Engineer", company: "WTX India" },
  // TechM4India's own team
  { id: "sirassu-ranjith", name: "Sirassu Ranjith", role: "AI Developer", company: "TechM4India" },
  { id: "thanneeru-pranay", name: "Thanneeru Pranay", role: "GenAI Trainer", company: "TechM4India" },
  { id: "e-vamsi-krishna", name: "E Vamsi Krishna", role: "R&D", company: "TechM4India" },
  // No company given
  { id: "sindhuri-bairi", name: "Sindhuri Bairi" },
  { id: "yarneni-bala-praneeth-sagar", name: "Yarneni Bala Praneeth Sagar" },
  // No photo yet: move up next to the other TCS entry once saikumar.webp is added
  { id: "saikumar", name: "Saikumar", role: "DevOps / Cloud Engineer", company: "TCS" },
];
