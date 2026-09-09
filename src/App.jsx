import { Separator } from '@base-ui/react/separator';
import NoiseBackground from './components/NoiseBackground.jsx';
import EmailCopyButton from './components/EmailCopyButton.jsx';

export default function App() {
  return (
    <main className="page">
      <NoiseBackground />
      <section className="panel">
        <p className="brand">ISGRAPH</p>
        <ul className="skills">
          <li>Design</li>
          <li>Code</li>
          <li>Sound</li>
        </ul>
        <Separator className="panel-separator" />
        <EmailCopyButton email="junichiromine@isgraph.jp" />
      </section>
    </main>
  );
}
