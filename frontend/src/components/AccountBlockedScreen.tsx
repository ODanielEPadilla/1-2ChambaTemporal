import BrandLogo from "./BrandLogo";

type Props = {
  title: string;
  message: string;
};

export default function AccountBlockedScreen({ title, message }: Props) {
  return (
    <div className="home-page">
      <div className="home-card">
        <BrandLogo size="lg" className="home-logo" />
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
