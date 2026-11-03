jQuery(document).ready(function($) {
    "use strict";

    // Navigation bar background change on scroll
    $(window).scroll(function() {
        var top = $(window).scrollTop();
        if (top >= 60) {
            $("nav").addClass('secondary'); // Triggers transparent/secondary background
        } else {
            if ($("nav").hasClass('secondary')) {
                $("nav").removeClass('secondary'); // Restores default background
            }
        }
    });

    // Slider Ripples Effect
    $('.slider').ripples({
        dropRadius: 11,
        perturbance: 0.01,
    });

    // Typed text effect
    $(".text").typed({
        strings: [
            "<strong>i love</strong><strong class='primary'> codings.</strong>",
            "<strong>and to</strong><strong class='primary'> share !!.</strong>"
        ],
        typespeed: 0,
        loop: true
    });

    // Magnific Popup for work section
    $('.work').magnificPopup({
        delegate: 'a', // child items selector, by clicking on it popup will open
        type: 'image',
        gallery: {
            enabled: true
        }
    });

    // Team Members Owl Carousel
    $("#team-members").owlCarousel({
        items: 3,
        autoplay: true,
        smartSpeed: 700,
        loop: true,
        autoplayHoverPause: true,
        responsive: {
            0: {
                items: 1
            },
            480: {
                items: 2
            },
            768: {
                items: 3
            }
        }
    });

    // Counter Up plugin
    $('.counter').counterUp({
        delay: 10,
        time: 4000
    });

    // Smooth Scrolling for anchor links
    $("a.smooth-scroll").click(function(event) {
        event.preventDefault();
        var section = $(this).attr("href");
        $('html, body').animate({
            scrollTop: $(section).offset().top - (-2)
        }, 1250, "easeInOutExpo");
    });

    // CTA Contact: scroll to form, prefill subject and focus the name field
    $('#cta-contact').on('click', function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
        var section = $(href);
        var subj = $(this).data('subject') || '';
        $('html, body').animate({
            scrollTop: section.offset().top - (-2)
        }, 1250, "easeInOutExpo", function() {
            if (subj) $('#subject').val(subj);
            $('#name').focus();
        });
    });

    // Initialize WOW animations
    new WOW().init();

    // Contact form: client-side validation and AJAX submission
    $('.contact-form').on('submit', function(e) {
        e.preventDefault();
        var $form = $(this);
        var $alert = $form.find('.form-alert');
        var name = $.trim($form.find('[name="name"]').val());
        var email = $.trim($form.find('[name="email"]').val());
        var subject = $.trim($form.find('[name="subject"]').val());
        var message = $.trim($form.find('[name="message"]').val());
        var source = $form.find('[name="source"]').val() || 'inline';

        function showAlert(type, msg) {
            if ($alert.length === 0) {
                // fallback to top page alert
                $alert = $('#form-alert');
            }
            $alert.removeClass('success error').addClass(type).text(msg).show();
            try {
                $('html,body').animate({ scrollTop: $alert.offset().top - 100 }, 300);
            } catch (e) {}
        }

        if (!name) { showAlert('error', 'Please enter your name.'); return; }
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailPattern.test(email)) { showAlert('error', 'Please enter a valid email address.'); return; }
        if (subject.length < 3) { showAlert('error', 'Please enter a subject.'); return; }
        if (message.length < 10) { showAlert('error', 'Please enter a message (at least 10 characters).'); return; }

        var $btn = $form.find('button[type=submit]');
        var originalBtnText = $btn.text();
        $btn.prop('disabled', true).text('Sending...');

        var postData = { name: name, email: email, subject: subject, message: message, source: source };
        var recaptchaSiteKey = $('body').data('recaptcha-sitekey') || '';
        var recaptchaEnabled = recaptchaSiteKey && recaptchaSiteKey !== 'YOUR_RECAPTCHA_SITE_KEY' && typeof grecaptcha !== 'undefined';

        function doAjaxWithData(data) {
            $.ajax({
                url: $form.attr('action'),
                method: 'POST',
                data: data,
                dataType: 'json',
                timeout: 15000
            }).done(function(resp) {
                if (resp && resp.success) {
                    showAlert('success', resp.message || 'Message sent successfully.');
                    $form[0].reset();
                    $btn.addClass('sent').text('Sent');
                    setTimeout(function() {
                        $btn.removeClass('sent').text(originalBtnText);
                    }, 1700);
                    if ($form.is('#modal-contactform')) {
                        setTimeout(closeModal, 1200);
                    }
                } else {
                    showAlert('error', resp.message || 'An error occurred while sending your message.');
                }
            }).fail(function() {
                showAlert('error', 'An error occurred while sending your message. Please try again later.');
            }).always(function() {
                $btn.prop('disabled', false).text(originalBtnText);
            });
        }

        if (recaptchaEnabled) {
            if (typeof grecaptcha === 'undefined') {
                showAlert('error', 'reCAPTCHA is not available. Please check your configuration.');
                $btn.prop('disabled', false).text(originalBtnText);
                return;
            }
            grecaptcha.execute(recaptchaSiteKey, { action: 'contact' }).then(function(token) {
                postData['g-recaptcha-response'] = token;
                doAjaxWithData(postData);
            }).catch(function() {
                showAlert('error', 'reCAPTCHA execution failed.');
                $btn.prop('disabled', false).text(originalBtnText);
            });
        } else {
            doAjaxWithData(postData);
        }
    });

    // Quick Contact modal open/close functions
    function openModal(subject) {
        var $modal = $('#quick-contact-modal');
        if (subject) $modal.find('[name="subject"]').val(subject);
        $modal.show().attr('aria-hidden', 'false');
        $('body').addClass('modal-open');
        $modal.find('[name="name"]').focus();
    }

    function closeModal() {
        var $modal = $('#quick-contact-modal');
        $modal.hide().attr('aria-hidden', 'true');
        $('body').removeClass('modal-open');
        $modal.find('.form-alert').hide().text('');
    }

    $('#cta-quick').on('click', function(e) {
        e.preventDefault();
        var subj = $(this).data('subject') || '';
        openModal(subj);
    });

    $('#quick-contact-modal .modal-close, #quick-contact-modal .modal-overlay').on('click', function() {
        closeModal();
    });

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});