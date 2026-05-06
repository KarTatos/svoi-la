import { Redirect, useLocalSearchParams } from "expo-router";

export default function TipsCategoryRoute() {
  const { category } = useLocalSearchParams();
  return <Redirect href={{ pathname: "/tips", params: { category: String(category || "") } }} />;
}
