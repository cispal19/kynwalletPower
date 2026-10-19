import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';

describe('BrandPanel (R5)', () => {
  it('FR-020: muestra el titular y el texto recibidos', () => {
    render(
      <BrandPanel
        title="Comienza tu camino financiero."
        description="Crea tu cuenta en minutos."
      />,
    );
    expect(screen.getByText('Comienza tu camino financiero.')).toBeInTheDocument();
    expect(screen.getByText('Crea tu cuenta en minutos.')).toBeInTheDocument();
  });

  it('muestra el logo y oculta la tarjeta decorativa a las tecnologías de asistencia', () => {
    const { container } = render(<BrandPanel title="Titular" description="Texto" />);
    expect(screen.getByText('KynWallet')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('Kyn Card');
  });
});
