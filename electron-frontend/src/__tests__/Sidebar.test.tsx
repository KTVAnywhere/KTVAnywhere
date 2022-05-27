import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeftSidebar, RightSidebar } from '../components/Sidebar';

describe('Sidebar component tests', () => {
  test('open Sidebar with toggle button', async () => {
    const mockLeftSetTrigger = jest.fn();
    const mockRightSetTrigger = jest.fn();

    render(
      <>
        <LeftSidebar trigger={false} setTrigger={mockLeftSetTrigger}>
          <div>
            <p>Left Sidebar open</p>
          </div>
        </LeftSidebar>
        <RightSidebar trigger={false} setTrigger={mockRightSetTrigger}>
          <div>
            <p>Right Sidebar open</p>
          </div>
        </RightSidebar>
      </>
    );

    const leftToggleButton = screen.getAllByTestId('toggle-sidebar-button')[0];
    const rightToggleButton = screen.getAllByTestId('toggle-sidebar-button')[1];
    fireEvent.click(leftToggleButton);
    fireEvent.click(rightToggleButton);

    expect(mockLeftSetTrigger).toBeCalledWith(true);
    expect(mockRightSetTrigger).toBeCalledWith(true);
  });

  test('collapse Sidebar with toggle button', async () => {
    const mockLeftSetTrigger = jest.fn();
    const mockRightSetTrigger = jest.fn();

    render(
      <>
        <LeftSidebar trigger setTrigger={mockLeftSetTrigger}>
          <div>
            <p>Left Sidebar open</p>
          </div>
        </LeftSidebar>
        <RightSidebar trigger setTrigger={mockRightSetTrigger}>
          <div>
            <p>Right Sidebar open</p>
          </div>
        </RightSidebar>
      </>
    );

    const leftToggleButton = screen.getAllByTestId('toggle-sidebar-button')[0];
    const rightToggleButton = screen.getAllByTestId('toggle-sidebar-button')[1];
    fireEvent.click(leftToggleButton);
    fireEvent.click(rightToggleButton);

    expect(mockLeftSetTrigger).toBeCalledWith(false);
    expect(mockRightSetTrigger).toBeCalledWith(false);
  });
});
