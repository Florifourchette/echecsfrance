import clientPromise from "@/lib/mongodb";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import TournamentTable from "@/components/TournamentTable";
import { dateOrderingFrance } from "@/utils/dbDateOrdering";
import { errorLog } from "@/utils/logger";

export const revalidate = 3600; // revalidate cache every 6 hours

/**
 * Imports the tournament map component, ensuring CSR only.
 * @remarks SSR is not supported by react-leaflet
 */
const TournamentMap = dynamic(() => import("@/components/TournamentMap"), {
  ssr: false,
  loading: () => (
    <div className="h-screen grid place-items-center text-gray-900 bg-white dark:bg-gray-800 dark:text-white">
      <p>Loading map...</p>
    </div>
  ),
});

const getTournaments = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("tournamentsFranceDB");
    const data = await dateOrderingFrance(db);
    return JSON.stringify(data);
  } catch (error) {
    errorLog(error);
    throw new Error("Error fetching tournament data");
  }
};

export default async function Tournaments() {
  const tournamentData = await getTournaments();

  return (
    <Layout>
      <main className="relative grid lg:grid-cols-2">
        <div className="">
          <TournamentMap tournamentData={JSON.parse(tournamentData)} />
        </div>
        <div className="relative bg-white dark:bg-gray-800 lg:overflow-y-auto">
          <TournamentTable tournamentData={JSON.parse(tournamentData)} />
        </div>
      </main>
    </Layout>
  );
}
