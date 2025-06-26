          {/* Customer Reviews */}
          {product.reviews?.length > 0 && (
            <div className="mt-5 px-4 pb-4">
              <h4 className="mb-4">
                <RiSpeakAiFill className="me-2 text-primary" /> Customer Reviews
              </h4>
              {product.reviews.map((review, index) => (
                <Card key={index} className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start flex-wrap">
                      <div>
                        <h6 className="mb-1">
                          <FaStar className="text-warning me-1" />
                          {review.rating} – {review.reviewerName}
                        </h6>
                        <p className="mb-0">{review.comment}</p>
                      </div>
                      <small className="text-muted text-end">
                        {review.date} <br /> {review.reviewerEmail}
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}