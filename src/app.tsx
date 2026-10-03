import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import HomePage from "@/pages/HomePage/HomePage";
import ResultPage from "@/pages/ResultPage/ResultPage";
import TestPage from "@/pages/TestPage/TestPage";
import WikiPage from "@/pages/WikiPage/WikiPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="result" element={<ResultPage />} />
        <Route path="test" element={<TestPage />} />
        <Route path="wiki" element={<WikiPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
