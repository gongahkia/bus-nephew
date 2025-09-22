import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading transit data...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingSpinner message={customMessage} />);

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should have correct styles applied', () => {
    const { container } = render(<LoadingSpinner />);
    const spinnerContainer = container.firstChild as HTMLElement;

    expect(spinnerContainer).toHaveStyle({
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
    });
  });
});