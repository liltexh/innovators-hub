import { Layout } from "../layout/layout";

function CourseLoading() {
  return (
    <Layout>
      <div className="loading-brutal w-full h-32 mb-10"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="loading-brutal aspect-4/3" />
        ))}
      </div>
    </Layout>
  );
}

export default CourseLoading;
