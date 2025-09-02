import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewList from "@/components/ReviewList";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/app/book/[id]/actions", () => ({
  voteReview: vi.fn(),
}));


describe("ReviewList", () => {
  const mockReviews = [
    {
      id: "review-1",
      volumeId: "volume-1",
      rating: 5,
      text: "Excelente libro, muy recomendado!",
      votes: 3,
    },
    {
      id: "review-2",
      volumeId: "volume-1",
      rating: 4,
      text: "Buen libro, aunque un poco largo.",
      votes: 1,
    },
  ];

  const byVotes = (n: number) => new RegExp(`^\\s*votos:\\s*${n}\\s*$`);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state when no reviews", () => {
    render(<ReviewList volumeId="volume-1" initial={[]} />);
    expect(screen.getByText("Sé el primero en reseñar.")).toBeInTheDocument();
  });

  it("should render all reviews with correct information", () => {
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    expect(
      screen.getByText("Excelente libro, muy recomendado!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Buen libro, aunque un poco largo.")
    ).toBeInTheDocument();
    expect(screen.getByText("⭐ 5 / 5")).toBeInTheDocument();
    expect(screen.getByText("⭐ 4 / 5")).toBeInTheDocument();
    expect(screen.getByText(byVotes(3))).toBeInTheDocument();
    expect(screen.getByText(byVotes(1))).toBeInTheDocument();

    const upvoteButtons = screen.getAllByText("👍");
    const downvoteButtons = screen.getAllByText("👎");
    expect(upvoteButtons).toHaveLength(2);
    expect(downvoteButtons).toHaveLength(2);
  });

  it("should sort reviews by votes (highest first)", () => {
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);
    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText(/Excelente libro/)).toBeInTheDocument();
    expect(within(items[1]).getByText(/Buen libro/)).toBeInTheDocument();
  });

  it("should handle upvote with optimistic update", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    expect(screen.getByText(byVotes(3))).toBeInTheDocument();
    expect(screen.getByText(byVotes(1))).toBeInTheDocument();

    const firstLi = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    await user.click(within(firstLi).getByText("👍"));

    expect(within(firstLi).getByText(byVotes(4))).toBeInTheDocument();
    expect(within(firstLi).queryByText(byVotes(3))).not.toBeInTheDocument();
    expect(mockVoteReview).toHaveBeenCalledWith("volume-1", "review-1", 1);

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should handle downvote with optimistic update", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockResolvedValueOnce(undefined);

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    const firstLi = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    await user.click(within(firstLi).getByText("👎"));

    expect(within(firstLi).getByText(byVotes(2))).toBeInTheDocument();
    expect(mockVoteReview).toHaveBeenCalledWith("volume-1", "review-1", -1);
  });

  it("should disable buttons during voting transition", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockImplementation(() => new Promise(() => {})); // nunca resuelve

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    const firstLi = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    await user.click(within(firstLi).getByText("👍"));

    expect(within(firstLi).getByText("👍")).toBeDisabled();
    expect(within(firstLi).getByText("👎")).toBeDisabled();
  });

  // ✅ Reordenamiento: siempre clickeamos la MISMA review con within(li)
  it("should reorder reviews after voting", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockResolvedValue(undefined);

    const user = userEvent.setup();

    const reviewsForReorder = [
      { ...mockReviews[0], votes: 2 }, // Excelente: 2
      { ...mockReviews[1], votes: 1 }, // Buen: 1
    ];

    render(<ReviewList volumeId="volume-1" initial={reviewsForReorder} />);

    // votamos SIEMPRE sobre "Buen libro..."
    const targetLi = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Buen libro, aunque un poco largo.")
      )!;

    await user.click(within(targetLi).getByText("👍")); // 1 -> 2
    await user.click(within(targetLi).getByText("👍")); // 2 -> 3
    await user.click(within(targetLi).getByText("👍")); // 3 -> 4

    expect(within(targetLi).getByText(byVotes(4))).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    // ahora "Buen libro..." debería estar primero
    expect(within(items[0]).getByText(/Buen libro/)).toBeInTheDocument();
  });

  it("should update when initial prop changes", () => {
    const { rerender } = render(
      <ReviewList volumeId="volume-1" initial={mockReviews} />
    );

    expect(screen.getAllByText(/libro/i)).toHaveLength(2);

    rerender(<ReviewList volumeId="volume-1" initial={[mockReviews[0]]} />);

    expect(screen.getAllByText(/libro/i)).toHaveLength(1);
    expect(
      screen.getByText("Excelente libro, muy recomendado!")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Buen libro, aunque un poco largo.")
    ).not.toBeInTheDocument();
  });

  it("should handle multiple votes on different reviews", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    const liExcelente = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    const liBuen = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Buen libro, aunque un poco largo.")
      )!;

    // Upvote primera review
    await user.click(within(liExcelente).getByText("👍"));
    expect(within(liExcelente).getByText(byVotes(4))).toBeInTheDocument();

    // Downvote segunda review
    await user.click(within(liBuen).getByText("👎"));
    expect(within(liBuen).getByText(byVotes(0))).toBeInTheDocument();

    expect(mockVoteReview).toHaveBeenCalledTimes(2);
    expect(mockVoteReview).toHaveBeenCalledWith("volume-1", "review-1", 1);
    expect(mockVoteReview).toHaveBeenCalledWith("volume-1", "review-2", -1);
  });

  it("should handle reviews with negative votes", () => {
    const reviewsWithNegativeVotes = [
      { ...mockReviews[0], votes: -2 },
      { ...mockReviews[1], votes: 1 },
    ];

    render(<ReviewList volumeId="volume-1" initial={reviewsWithNegativeVotes} />);

    expect(screen.getByText(byVotes(-2))).toBeInTheDocument();
    expect(screen.getByText(byVotes(1))).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText(/Buen libro/)).toBeInTheDocument(); // 1 primero
    expect(
      within(items[1]).getByText(/Excelente libro/)
    ).toBeInTheDocument(); // -2 después
  });

  it("should handle reviews with zero votes", () => {
    const reviewsWithZeroVotes = [
      { ...mockReviews[0], votes: 0 },
      { ...mockReviews[1], votes: 0 },
    ];

    render(<ReviewList volumeId="volume-1" initial={reviewsWithZeroVotes} />);

    const zeroVoteTexts = screen.getAllByText(byVotes(0));
    expect(zeroVoteTexts).toHaveLength(2);
  });

  it("should maintain review order when votes are equal", () => {
    const reviewsWithEqualVotes = [
      { ...mockReviews[0], votes: 2 },
      { ...mockReviews[1], votes: 2 },
    ];

    render(<ReviewList volumeId="volume-1" initial={reviewsWithEqualVotes} />);

    const items = screen.getAllByRole("listitem");
    expect(
      within(items[0]).getByText(/Excelente libro/)
    ).toBeInTheDocument();
    expect(within(items[1]).getByText(/Buen libro/)).toBeInTheDocument();
  });

  it("should handle API errors gracefully", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockRejectedValueOnce(new Error("API Error"));

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    const liExcelente = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    await user.click(within(liExcelente).getByText("👍"));

    // update optimista igual
    expect(within(liExcelente).getByText(byVotes(4))).toBeInTheDocument();

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("should handle single review correctly", () => {
    const singleReview = [mockReviews[0]];
    render(<ReviewList volumeId="volume-1" initial={singleReview} />);

    expect(
      screen.getByText("Excelente libro, muy recomendado!")
    ).toBeInTheDocument();
    expect(screen.getByText(byVotes(3))).toBeInTheDocument();
    expect(screen.getAllByText("👍")).toHaveLength(1);
    expect(screen.getAllByText("👎")).toHaveLength(1);
    expect(
      screen.queryByText("Buen libro, aunque un poco largo.")
    ).not.toBeInTheDocument();
  });

  it("should handle reviews with very high vote counts", () => {
    const highVoteReviews = [
      { ...mockReviews[0], votes: 999 },
      { ...mockReviews[1], votes: 1000 },
    ];

    render(<ReviewList volumeId="volume-1" initial={highVoteReviews} />);

    expect(screen.getByText(byVotes(999))).toBeInTheDocument();
    expect(screen.getByText(byVotes(1000))).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    expect(within(items[0]).getByText(/Buen libro/)).toBeInTheDocument(); // 1000 primero
  });

  it("should preserve review text and rating during voting", async () => {
    const { voteReview } = await import("@/app/book/[id]/actions");
    const mockVoteReview = vi.mocked(voteReview);
    mockVoteReview.mockResolvedValue(undefined);

    const user = userEvent.setup();
    render(<ReviewList volumeId="volume-1" initial={mockReviews} />);

    const liExcelente = screen
      .getAllByRole("listitem")
      .find((li) =>
        within(li).queryByText("Excelente libro, muy recomendado!")
      )!;
    await user.click(within(liExcelente).getByText("👍"));

    expect(
      within(liExcelente).getByText("Excelente libro, muy recomendado!")
    ).toBeInTheDocument();
    expect(within(liExcelente).getByText("⭐ 5 / 5")).toBeInTheDocument();
    expect(within(liExcelente).getByText(byVotes(4))).toBeInTheDocument();
  });
});
