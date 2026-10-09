import React from 'react';

interface DualLogosProps {
  /** Extra class hooks for the two <img> elements (size/shape per surface). */
  imgClassName?: string;
  puClassName?: string;
  departmentClassName?: string;
  puAlt?: string;
  departmentAlt?: string;
}

/**
 * PU logo + department logo, always side-by-side with PU first.
 * Used on every page (public navbar/footer, admin nav, login card).
 */
const DualLogos: React.FC<DualLogosProps> = ({
  imgClassName = '',
  puClassName = '',
  departmentClassName = '',
  puAlt = 'Pentecost University logo',
  departmentAlt = 'Department of Built Environment logo',
}) => (
  <>
    <img
      src="/assets/logos/pu-logo.jpg"
      alt={puAlt}
      className={`${imgClassName} ${puClassName}`.trim()}
    />
    <img
      src="/assets/logos/department-logo.jpg"
      alt={departmentAlt}
      className={`${imgClassName} ${departmentClassName}`.trim()}
    />
  </>
);

export default DualLogos;
