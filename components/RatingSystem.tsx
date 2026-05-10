import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { Review } from '../types';

interface RatingSystemProps {
  userId: string;
  userName: string;
  userRating?: number;
  totalReviews?: number;
  onReviewSubmit?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onComplaint?: (reason: string, description: string) => void;
  showComplaintButton?: boolean;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  userId,
  userName,
  userRating = 0,
  totalReviews = 0,
  onReviewSubmit,
  onComplaint,
  showComplaintButton = false
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');

  const handleSubmitReview = () => {
    if (rating === 0 || !comment.trim()) return;
    
    onReviewSubmit?.({
      reviewerId: 'current-user', // This would come from auth context
      reviewerName: 'Current User',
      revieweeId: userId,
      rating,
      comment: comment.trim()
    });
    
    setRating(0);
    setComment('');
    setShowReviewForm(false);
  };

  const handleSubmitComplaint = () => {
    if (!complaintReason.trim() || !complaintDescription.trim()) return;
    
    onComplaint?.(complaintReason.trim(), complaintDescription.trim());
    
    setComplaintReason('');
    setComplaintDescription('');
    setShowComplaintForm(false);
  };

  const renderStars = (interactive: boolean = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 24 : 16}
            className={`${
              star <= (interactive ? (hoveredRating || rating) : userRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Rating Display */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2">
          {renderStars()}
          <span className="font-semibold text-slate-900">
            {userRating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-slate-600">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
        <div className="flex-1 flex justify-end gap-2">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <MessageSquare size={14} />
            Review
          </button>
          {showComplaintButton && (
            <button
              onClick={() => setShowComplaintForm(!showComplaintForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
            >
              <Flag size={14} />
              Report
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-3">Write a Review for {userName}</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Rating
            </label>
            {renderStars(true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              placeholder="Share your experience with this helper..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={rating === 0 || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Complaint Form */}
      {showComplaintForm && (
        <div className="p-4 bg-white border border-red-200 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-3">Report an Issue with {userName}</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Complaint
            </label>
            <select
              value={complaintReason}
              onChange={(e) => setComplaintReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="Poor Quality">Poor Quality Work</option>
              <option value="No Show">Helper Didn't Show Up</option>
              <option value="Unprofessional">Unprofessional Behavior</option>
              <option value="Late">Late Delivery</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={complaintDescription}
              onChange={(e) => setComplaintDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Please describe the issue in detail..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitComplaint}
              disabled={!complaintReason.trim() || !complaintDescription.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Complaint
            </button>
            <button
              onClick={() => setShowComplaintForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;
