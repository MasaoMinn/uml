import type { GetStaticProps } from 'next';

type Props = {
  data: string;
};

const ExamplePage = ({ data }: Props) => {
  return <div>{data}</div>;
};

export const getStaticProps: GetStaticProps = async () => {
  const data = 'This is static data';
  return {
    props: {
      data,
    },
    // Remove the revalidate option
    // revalidate: 60 * 60, 
  };
};

export default ExamplePage;
