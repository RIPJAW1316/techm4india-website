/**
 * Consultant network shown on the landing page.
 *
 * Source: the consultant onboarding form responses supplied by the client
 * (27 responses, 26 Oct to 5 Nov 2026). Only the name and the photograph are
 * published. Roles, employers, contact details and ID numbers from the form
 * are deliberately left out.
 *
 * Photographs live in public/images/consultants/<id>.webp (portrait, about
 * 4:5). A person without a file yet is shown with their initials, so adding
 * a photo is the whole step: drop the file in with the matching id.
 *
 * Names are title-cased from the form. "Cheruku Nikhil Goud" was typed
 * "Nikhi goud"; the LinkedIn handle on the same row reads "nikhil-cheruku".
 */

export type Consultant = {
  /** Also the photo's file name, without the extension. */
  id: string;
  name: string;
};

export const consultantPhoto = (id: string) => "/images/consultants/" + id + ".webp";

export const consultants: Consultant[] = [
  { id: "sirassu-ranjith", name: "Sirassu Ranjith" },
  { id: "vadapally-nikhil-swaroop", name: "Vadapally Nikhil Swaroop" },
  { id: "bothula-pavan-kalyan", name: "Bothula Pavan Kalyan" },
  { id: "sirassu-rashmi", name: "Sirassu Rashmi" },
  { id: "vineeth", name: "Vineeth" },
  { id: "srideep-kuncham", name: "Srideep Kuncham" },
  { id: "akhil-sura", name: "Akhil Sura" },
  { id: "venkata-prem-sai", name: "Venkata Prem Sai" },
  { id: "cheruku-nikhil-goud", name: "Cheruku Nikhil Goud" },
  { id: "saikumar", name: "Saikumar" },
  { id: "sevarthi-uttam-kumar", name: "Sevarthi Uttam Kumar" },
  { id: "thanneeru-pranay", name: "Thanneeru Pranay" },
  { id: "sumanth-gopishetti", name: "Sumanth Gopishetti" },
  { id: "ponaganti-shashank", name: "Ponaganti Shashank" },
  { id: "peta-sumantha", name: "Peta Sumantha" },
  { id: "meruga-taraka-srinivas", name: "Meruga Taraka Srinivas" },
  { id: "sainandhan-jilla", name: "Sainandhan Jilla" },
  { id: "abhilash-goud-ranam", name: "Abhilash Goud Ranam" },
  { id: "sindhuri-bairi", name: "Sindhuri Bairi" },
  { id: "boda-anji-reddy", name: "Boda Anji Reddy" },
  { id: "raguveer-reddy", name: "Raguveer Reddy" },
  { id: "yarneni-bala-praneeth-sagar", name: "Yarneni Bala Praneeth Sagar" },
  { id: "tr-divyakanth", name: "TR Divyakanth" },
  { id: "e-vamsi-krishna", name: "E Vamsi Krishna" },
  { id: "madipeddi-shiva-shankar", name: "Madipeddi Shiva Shankar" },
  { id: "jujjavrapu-tapaswi", name: "Jujjavrapu Tapaswi" },
  { id: "soma-harshith-reddy", name: "Soma Harshith Reddy" },
];
